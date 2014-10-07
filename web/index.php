<?php

require_once __DIR__.'/../vendor/autoload.php';

use Neoxygen\Neogen\Parser\CypherPattern,
    Neoxygen\Neogen\Schema\Processor;

$app = new Silex\Application();
$app['debug'] = true;
$app['parser'] = new CypherPattern();
$app['processor'] = new Processor();
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../src/Views',
));
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());

$app->get('/', 'Neoxygen\\Graphgen\\Controller\\WebController::home')
    ->bind('home');

$app->post('/api/pattern/process', 'Neoxygen\\Graphgen\\Controller\\WebController::transformPattern')
    ->bind('api_pattern_transform');

$app->run();